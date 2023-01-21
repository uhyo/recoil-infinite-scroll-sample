import { FC, Fragment } from "react";
import { usePokemonList } from "../../dataflow/pokemonList";
import { Loading } from "../Loading";

export const PokemonList: FC = () => {
  const { pokemons, mightHaveMore } = usePokemonList();

  return (
    <Fragment>
      <dl>
        {pokemons.map((pokemon) => (
          <div key={pokemon.id}>
            <dt lang="ja">{pokemon.ja}</dt>
            <dd>
              {pokemon.en} <span>#{pokemon.id}</span>
            </dd>
          </div>
        ))}
      </dl>
      {mightHaveMore && <Loading />}
    </Fragment>
  );
};
