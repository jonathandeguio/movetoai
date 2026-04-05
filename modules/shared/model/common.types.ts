export type NamedOption = {
  id: string;
  name: string;
};

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;
