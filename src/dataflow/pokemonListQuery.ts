import { Client, gql } from "@urql/core";
import { selectorFamily } from "recoil";

const client = new Client({
  url: "https://beta.pokeapi.co/graphql/v1beta",
});

const query = gql<QueryResult, QueryInput>`
  query ($offset: Int!, $limit: Int!) {
    species: pokemon_v2_pokemonspecies(
      where: {}
      order_by: { id: asc }
      offset: $offset
      limit: $limit
    ) {
      name
      id
      pokemon_v2_pokemonspeciesnames(where: { language_id: { _in: [9, 11] } }) {
        language_id
        name
      }
    }
  }
`;

export type QueryResult = {
  species: readonly {
    readonly name: string;
    readonly id: number;
    readonly pokemon_v2_pokemonspeciesnames: readonly {
      language_id: 9 | 11;
      name: string;
    }[];
  }[];
};
type QueryInput = {
  offset: number;
  limit: number;
};

export const pokemonListWithQuery = selectorFamily<
  QueryResult,
  {
    limit: number;
    offset: number;
  }
>({
  key: "dataflow/pokemonListQuery/pokemonListWithOffset",
  get:
    ({ limit, offset }) =>
    async () => {
      const result = await client
        .query(query, {
          offset,
          limit,
        })
        .toPromise();
      if (result.error) {
        throw result.error;
      }
      if (result.data === undefined) {
        throw new Error("No data");
      }
      return result.data;
    },
});