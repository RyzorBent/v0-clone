import components from "../../templates/components.json";

export const transformCode = (code: string) => {
  return code
    .replace(/@\/lib\/utils/, components.aliases.utils)
    .replace(/@\/components\/ui/, components.aliases.ui)
    .replace(/@\/registry\/[^/]+\/ui/, components.aliases.ui)
    .replace(/@\/registry\/[^/]+/, components.aliases.ui);
};
