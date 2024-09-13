// TODO: Make this actually authorize...

import { IoTCustomAuthorizerHandler } from "aws-lambda";
import { Resource } from "sst";

export const handler: IoTCustomAuthorizerHandler = async (_, context) => {
  const [, , , region, accountId] = context.invokedFunctionArn.split(":");
  return {
    isAuthenticated: true,
    principalId: "test",
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: [
              `arn:aws:iot:${region}:${accountId}:topicfilter/${Resource.App.name}/${Resource.App.stage}/*`,
            ],
          },
          {
            Action: "iot:Publish",
            Effect: "Allow",
            Resource: [
              `arn:aws:iot:${region}:${accountId}:topic/${Resource.App.name}/${Resource.App.stage}/*`,
            ],
          },
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: [
              `arn:aws:iot:${region}:${accountId}:topic/${Resource.App.name}/${Resource.App.stage}/*`,
            ],
          },
        ],
      },
    ],
  };
};
