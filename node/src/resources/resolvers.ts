import { PubSub } from "graphql-subscriptions"
import { WeatherAPI, PlacesAPI } from "./rest"

import DataLoader from "dataloader"

import books from "../data/books.json"
import authors from "../data/authors.json"

interface ContextValue {
  user: any
  dataSources: {
    placesAPI: PlacesAPI
    weatherAPI: WeatherAPI
  }
}
const pubsub = new PubSub()

let currentNumber = 0
// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber })
  setTimeout(incrementNumber, 1000)
}
// Start incrementing
incrementNumber()

export const resolvers = {
  Subscription: {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"])
    }
  },
  Query: {
    currentNumber() {
      return currentNumber
    },
    hello: () => "world",
    places: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parent: any,
      args: { name: string },
      contextValue: ContextValue,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: any
    ) => {
      let places = contextValue.dataSources.placesAPI.getPlace(args.name)
      return places
    },
    weather: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parent: any,
      args: { latitude: number; longitude: number },
      contextValue: ContextValue,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: any
    ) => {
      let weather = contextValue.dataSources.weatherAPI.getWeather(
        args.latitude.toString(),
        args.longitude.toString()
      )
      return weather
    },
    books: () => books,
  },

  Book: {
    // author: parent => {
    //   console.log(authors.find(author => author.id === parent.author))
    //   return authors.find(author => author.id === parent.author)
    // },
    author: (parent: any) => {
      const authorLoader = new DataLoader((keys: any) => {
        const result = keys.map((authorId: any) => {
          return authors.find((author) => author.id === authorId)
        })

        return Promise.resolve(result)
      })

      return authorLoader.load(parent.author)
    }
  }
  // Mutation: {

  // },
}
