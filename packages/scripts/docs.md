## Frontend Editor Configuration

1. Fetch components from the shadcn/ui registry.
2. Transform component code for compatibility with the local development environment.
3. Analyze components to determine their NPM dependencies.
4. Fetch the current versions of the dependencies from the NPM registry.
5. Generate the output files, including the `package.json`, `tailwind.config.js`, and the component code.
6. Write the output to a single JSON file that can be used by the frontend editor.

## Knowledge Base

### Components

1. Fetch components and source code from the shadcn/ui registry.
2. Fetch documentation from the shadcn/ui repository on GitHub.
3. For examples referenced in the documentation, fetch the example code from the shadcn/ui GitHub repository.
4. Pass the complete documentation for each component to an LLM to make the data as useful as possible when querying and using the knowledge base.
5. Store the refined data in a vector database (Pinecone).

### Examples

1. Fetch examples by reading the internal shadcn/ui registry from GitHub.
2. For examples that do not include a description, use an LLM to generate one.
3. Generate embeddings for the examples using the OpenAI API.
4. Store embeddings in Pinecone.

## Runtime

1. Query refinement and component selection model
   - Example: If the user asks for a login form, the model will:
     - Determine that the "Button", "Input", and "Label" components are necessary.
     - Generate a refined description of what the user is asking for.
   - Example: If the user isn't asking for a React component, skip the context retrieval step.
2. Context retrieval
   - Retrieve relevant examples by querying the Pinecone knowledge base.
3. Response generation
4. Response transformation
