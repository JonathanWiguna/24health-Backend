const mongoose = require("mongoose");

async function main() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  connectToServer: main,
};
