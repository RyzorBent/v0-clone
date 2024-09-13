import { iot, mqtt } from "aws-iot-device-sdk-v2";
import { EventEmitter } from "events";
import type TypedEventEmitter from "typed-emitter";

export interface RealTimeOptions {
  endpoint: string;
  authorizer: string;
  topic: string;
  token: string;
}

export class RealTimeClient extends (EventEmitter as new () => TypedEventEmitter<{
  message: (message: string) => void;
  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
}>) {
  private readonly connection: mqtt.MqttClientConnection;
  private readonly decoder = new TextDecoder("utf8");

  connected = false;

  constructor(private readonly options: RealTimeOptions) {
    super();

    this.connection = this.createConnection();

    this.connection.on("connect", () => {
      this.connected = true;
      this.emit("connect");
    });
    this.connection.on("disconnect", () => {
      this.connected = false;
      this.emit("disconnect");
    });
    this.connection.on("message", (_, payload) => {
      const body = this.decoder.decode(new Uint8Array(payload));
      this.emit("message", body);
    });
    this.connection.on("error", (error) => {
      this.emit("error", error);
    });
    this.connection.on("connection_failure", ({ error }) => {
      this.emit("error", error as Error);
    });
  }

  async connect() {
    await this.connection.connect();
  }

  async subscribe() {
    if (!this.connected) {
      throw new Error("Not connected");
    }
    await this.connection.subscribe(this.options.topic, mqtt.QoS.AtLeastOnce);
  }

  async disconnect() {
    await this.connection.disconnect();
  }

  private createConnection() {
    const client = new mqtt.MqttClient();
    const id = window.crypto.randomUUID();
    return client.new_connection(
      iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(true)
        .with_client_id(id)
        .with_endpoint(this.options.endpoint)
        .with_custom_authorizer(
          "",
          this.options.authorizer,
          "",
          this.options.token,
        )
        .build(),
    );
  }
}
