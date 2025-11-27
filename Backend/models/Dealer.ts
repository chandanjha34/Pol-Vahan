import mongoose from "mongoose";
const DealerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Dealer_ID:{type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});



const Dealer = mongoose.model("Dealer", DealerSchema);
export default Dealer;
