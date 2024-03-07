import { User } from "../models/User"

export async function createUser(args) {
  console.log("The table for the User model was just (re)created!")
  const { username, email } = args
  try {
    const newUser = await User.create({
      username,
      email
    });
    console.log("New user created:", newUser.toJSON());
  } catch (error) {
    console.error("Unable to create User:", error)
  }


}