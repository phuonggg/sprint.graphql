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
    AttacksFast: singleAttacks 
  }  



  type Mutation {
    CreatePokemon(name: String, id: String): Pokemon
    DeletePokemon(newName: String, id: String): String
    EditPokemon(newName: String, id: String): Pokemon
    CreateType(type: String): String
    EditType(type: String, newType: String): String
    DeleteType(type: String): String
    CreateAttack(attack: String, type: String, damage: Int): singleAttacks
    EditAttack(attack: String, type: String, damage: Int): singleAttacks
    DeleteAttack(attack: String): singleAttacks
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

  AttacksFast: () => {
    return data.attacks.fast;
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

  // createPokemon: (request) => {
  //   console.log(Object.keys(request))
  //   console.log(request.name, request.id)
  // }

  CreatePokemon: (request) => {
    const newPoke = {};
    newPoke.id = request.id;
    newPoke.name = request.name;
    data.pokemon.push(newPoke);
    return data.pokemon[data.pokemon.length - 1];
  },

  EditPokemon: (request) => {
    // request.id, request.newName, request
    const idnum = parseInt(request.id);
    data.pokemon[idnum - 1].name = request.newName;
    return data.pokemon[idnum - 1];
  },

  DeletePokemon: (request) => {
    const idnum = parseInt(request.id);
    console.log(data.pokemon[idnum - 1]);
    data.pokemon[idnum - 1] = {
      name: "This pokemon was deleted",
      id: request.id,
    };
    console.log(data.pokemon[idnum - 1]);
    return data.pokemon[idnum - 1].name;
  },

  CreateType: (request) => {
    data.types.push(request.type);
    return data.types[data.types.length - 1];
  },

  EditType: (request) => {
    // request.id, request.newName, request
    let index;
    for (let i = 0; i < data.types.length; i++) {
      if (data.types[i] === request.type) {
        index = i;
      }
      data.types[index] = request.newType;
    }
    return data.types[index];
  },

  DeleteType: (request) => {
    // request.id, request.newName, request
    let index;
    for (let i = 0; i < data.types.length; i++) {
      if (data.types[i] === request.type) {
        index = i;
      }
      data.types[index] = "This type was DELETED!!!!";
    }
    return data.types[index];
  },

  CreateAttack: (request) => {
    const newAttack = {};
    newAttack.name = request.attack;
    newAttack.type = request.type;
    newAttack.damage = request.damage;
    data.attacks.fast.push(newAttack);
    return data.attacks.fast[data.attacks.fast.length - 1];
  },

  EditAttack: (request) => {
    if (
      data.attacks.fast.filter((el) => el.name === request.attack).length > 0
    ) {
      for (let el of data.attacks.fast) {
        if (el.name === request.attack) {
          el.type = request.type;
          el.damage = request.damage;
          return el;
        }
      }
    }
    for (let el of data.attacks.special) {
      if (el.name === request.attack) {
        el.type = request.type;
        el.damage = request.damage;
        return el;
      }
    }
  },

  DeleteAttack: (request) => {
    if (
      data.attacks.fast.filter((el) => el.name === request.attack).length > 0
    ) {
      for (let el of data.attacks.fast) {
        if (el.name === request.attack) {
          el.name = "DELETED";
          el.type = "Deleted";
          el.damage = -10000;
          return el;
        }
      }
    }
    for (let el of data.attacks.special) {
      if (el.name === request.attack) {
        el.name = "DELETED";
        el.type = "Deleted";
        el.damage = -10000;
        return el;
      }
    }
  },
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
