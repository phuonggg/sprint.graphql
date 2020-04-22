const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String!): Pokemon
    PokemonByType(type: String!): [Pokemon] 
    PokemonById(id: String!): Pokemon
    PokemonByAttack(attack: String!): [Pokemon]
  }  

  input PokemonInput {
    id: String
    name: String
  }

  type Mutation {
    createPokemon(input: PokemonInput): Pokemon
  }

type Pokemon {
    id: String
    name: String!
    classification: String
    types: [String] 
    weight: weight
    attacks: attacks
    evolutions: [Pokemon]
  }

  type weight {
    minimum: String
    maximum: String
  }

  type attacks {
    fast: [singleAttacks]
    special: [singleAttacks]
  }

  type fast {
    attack: [singleAttacks]
  }

  type special {
    attack: [singleAttacks]
  }

  type singleAttacks {
    name: String
    type: String
    damage: Int
  }

`);
// Question from Chip - Why Backticks?

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },

  Pokemon: (request) => {
    return data.pokemon.find((pokemon) => pokemon.name === request.name);
  },

  PokemonById: (request) => {
    return data.pokemon.find((pokemon) => pokemon.id === request.id);
  },

  PokemonByType: (request) => {
    return data.pokemon.filter((poke) => {
      return poke.types.includes(request.type);
    });
  },

  PokemonByAttack: (request) => {
    let output = [];
    if (
      data.attacks.fast.filter((el) => el.name === request.attack).length > 0
    ) {
      // Now we are doing fast attacks
      //We want to go into pokemon.data[i].fast and see if it includes the requested attack
      for (el of data.pokemon) {
        for (item of el.attacks.fast) {
          if (item.name === request.attack) {
            output.push(el);
          }
        }
      }
      return output;
    } else {
      //Now we are doing special attacks.
      for (el of data.pokemon) {
        for (item of el.attacks.special) {
          if (item.name === request.attack) {
            output.push(el);
          }
        }
      }
      return output;
    }
  },

  /*
  check if attack is in fast, if yes:
  filter to get array of poke that include that attack:
    
  
  */
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
