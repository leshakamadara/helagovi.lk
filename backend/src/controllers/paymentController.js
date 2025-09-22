import Transaction from "../models/Transaction.js";




export async function getAllTransaction(req,res){
    
    try {
        const transaction=await Transaction.find();
        res.status(200).json(transaction);



    } catch (error) {

        console.error("Error in paym controller",error);
        res.status(500).json({message:"Internal server error"});

    }


}





export async function createTransaction(req,res){


    try {
        const { buyerId, orderId, amount, currency, state } = req.body;

        const newTransaction = new Transaction({ buyerId,orderId,amount,currency,state});

        

        await newTransaction.save();
        res.status(200).json({message:"Note created successfully"});

        



    } catch (error) {
        console.error("Error in paym controller",error);
        res.status(500).json({message:"Internal server error"});
    }

}







export async function updateTransaction(req,res){

    try {

        const{buyerId, orderId, amount, currency, state}=req.body;
        const updateT=await Transaction.findByIdAndUpdate(req.params.id,{buyerId, orderId, amount, currency, state},
            {new:true,});

        if(!updateT) return res.status(404).json({message: "Not Found"})
        
        res.status(200).json({updateT});


    } catch (error) {

        console.error("Error in payment controller",error);
        res.status(500).json({message:"Internal server error"});
        
    }

}





export async function deleteTransaction(req,res){
    
    try {
        
        const deleteTransaction = await Transaction.findByIdAndDelete(req.params.id)
        if(!deleteTransaction) return res.status(404).json({message:"Transaction Not found"});
        res.json({message: "Note deleted successfully !"})


    } catch (error) {

        console.error("Error in payment controller",error);
        res.status(500).json({message:"Internal server error"});
 
        
    }


}

