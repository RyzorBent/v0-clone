// import { writeFileSync } from "fs";
// import {
//   StringOutputParser,
//   StructuredOutputParser,
// } from "@langchain/core/output_parsers";
// import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
// import {
//   Runnable,
//   RunnableBranch,
//   RunnableLambda,
//   RunnablePassthrough,
//   RunnableSequence,
// } from "@langchain/core/runnables";
// import { ChatOpenAI } from "@langchain/openai";
// import { Resource } from "sst";
// import { z } from "zod";

// import blocks from "./blocks.json";
// import components from "./components.json";

// const queryRefinementPrompt = PromptTemplate.fromTemplate<{
//   userQuery: string;
//   chatHistory: string;
//   formatInstructions: string;
// }>(`
// You are an expert software engineer and UI/UX designer specializing in React and the shadcn/ui component library.
// Your task is to analyze the user's query, determine the appropriate response type, and provide relevant information.

// shadcn/ui is a collection of re-usable components built using Radix UI and Tailwind CSS. It's not a component library, but a collection of re-usable components that you can copy and paste into your apps.

// Here are the shadcn/ui components you can choose from:
// - ${components
//   .map((component) => `- ${component.name}: ${component.description}`)
//   .join("\n")}

// The shadcn/ui documentation includes blocks, which are collections of components meant to exhibit usage and best practices. If a user's request is similar to one of the following blocks, please provide the name of the block:
// - ${blocks.map((block) => `- ${block.name}: ${block.description}`).join("\n")}

// Given the user's request and the chat history, please:
// 1. Determine if the request requires generating a React component or a conversational response
// 2. If generating a component:
//    a. Think from a design and implementation perspective about what the user wants to build and how we can implement it.
//    b. Identify if the user's request is similar to one of the blocks.
//    c. Identify relevant shadcn/ui components.
//    d. Generate a detailed query for the component generation chain.
// 3. If the user's request is not a component request, respond in a conversational manner.

// User's request: {userQuery}
// Chat history: {chatHistory}

// {formatInstructions}
// `);

// type InferOutputParserType<T> =
//   T extends StructuredOutputParser<infer U> ? z.infer<U> : never;

// const queryRefinementOutput = StructuredOutputParser.fromZodSchema(
//   z.discriminatedUnion("type", [
//     z.object({
//       type: z.literal("component"),
//       reasoning: z.string(),
//       components: z.array(z.string()),
//       block: z.string().optional(),
//       query: z.string(),
//     }),
//     z.object({
//       type: z.literal("conversation"),
//     }),
//   ]),
// );

// const componentGenerationPrompt = PromptTemplate.fromTemplate<{
//   refinedQuery: string;
//   components: string;
//   referenceBlock?: string;
//   formatExample: string;
// }>(`
// You are an expert frontend React engineer and UI/UX designer. Your task is to generate a React component based on the refined user request and the provided context.

// Refined request:
// {refinedQuery}

// Relevant shadcn/ui components:
// {components}

// Reference block:
// {referenceBlock}

// Instructions:
// 1. Create a React component that fulfills the refined request.
// 2. Ensure the component has a default export and no required props.
// 3. Use TypeScript and make the component interactive with state when necessary.
// 4. Style the component using Tailwind CSS classes.
// 5. Incorporate the relevant shadcn/ui components appropriately.
// 6. If a relevant block is provided, use it as inspiration for your implementation, adapting it to the current request.
// 7. Provide a complete, well-formatted React component code, including necessary imports.
// 8. Only use the shadcn/ui components listed above and standard React/TypeScript features.
// 9. Ensure your code is functional, well-structured, and follows best practices.
// 10. After the component code, provide a brief explanation of how the component works, including how shadcn/ui components are utilized, any inspiration taken from the relevant block (if provided), and any key features or decisions made in its implementation.
// 11. Wrap the generated code in <Artifact> tags.
// 12. Include a title, identifier, and type in the opening <Artifact> tag.
// 13. To update the code, recreate the artifact using the same identifier.
// 14. Do not include backticks, triple backticks, or any other code block indicators around the code inside the Artifact tags. The code should be directly inside the Artifact tags without any additional formatting.
// 15. Ensure that the Artifact tags are on separate lines from the code content.

// Example:
// <Artifact title="Button Component" identifier="button-component" type="tsx">
// import React from 'react';
// import { Button } from '~/components/ui/button';

// export default function CustomButton() {
//   return <Button>Click me</Button>;
// }
// </Artifact>
// `);

// const formatExample = `
// `;
// const chatModel = new ChatOpenAI({
//   modelName: "gpt-4o-mini",
//   openAIApiKey: Resource.OpenAIAPIKey.value,
// });

// const queryRefinementChain = RunnableSequence.from([
//   queryRefinementPrompt,
//   chatModel,
//   queryRefinementOutput,
// ]);

// const conversationChain = RunnableSequence.from([
//   PromptTemplate.fromTemplate<{
//     chatHistory: string;
//     userQuery: string;
//   }>(
//     [
//       "You are an expert software engineer and UI/UX designer specializing in React and the shadcn/ui component library.",
//       "It has been determined that the user's request does not require a component. Please respond to the user's request as best as you can.",
//       "{chatHistory}",
//       "{userQuery}",
//     ].join("\n"),
//   ),
//   chatModel,
//   new StringOutputParser(),
// ]);

// const componentGenerationChain = RunnableSequence.from([
//   componentGenerationPrompt,
//   chatModel,
//   new StringOutputParser(),
// ]);

// type RefinedQuery = InferOutputParserType<typeof queryRefinementOutput>;
// type ComponentQuery = Extract<RefinedQuery, { type: "component" }>;

// const buildComponentGenerationContext = (
//   query: ComponentQuery,
// ): {
//   refinedQuery: string;
//   components: string;
//   referenceBlock?: string;
//   formatExample: string;
// } => {
//   const matchedComponents = components.filter((component) =>
//     query.components.includes(component.name),
//   );
//   const matchedBlock = blocks.find((block) => block.name === query.block);

//   return {
//     refinedQuery: query.query,
//     components: matchedComponents
//       .map(
//         (component) =>
//           `<Component name="${component.name}" description="${component.description}">\n${component.examples
//             .slice(0, 1)
//             .map(
//               (example) =>
//                 `<Example name="${example.name}" description="${example.description}">\n${example.content}\n</Example>`,
//             )
//             .join(", ")}\n</Component>`,
//       )
//       .join("\n\n"),
//     referenceBlock: matchedBlock
//       ? `<Block name="${matchedBlock.name}" description="${matchedBlock.description}">\n${matchedBlock.content}\n</Block>`
//       : "No block provided.",
//     formatExample,
//   };
// };

// async function execute(query: string, history: string) {
//   const refinedQuery = await queryRefinementChain.invoke({
//     userQuery: query,
//     chatHistory: history,
//     formatInstructions: queryRefinementOutput.getFormatInstructions(),
//   });
//   if (refinedQuery.type === "conversation") {
//     return conversationChain.stream({
//       chatHistory: history,
//       userQuery: query,
//     });
//   }
//   const componentGenerationContext =
//     buildComponentGenerationContext(refinedQuery);
//   return await componentGenerationChain.stream(componentGenerationContext);
// }

// const result = await execute("Hi, how are you?", "");
// for await (const chunk of result) {
//   console.log(chunk);
// }
