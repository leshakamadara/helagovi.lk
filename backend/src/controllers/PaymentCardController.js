import SavedCard from "../models/SavedCard.js"











export async function getCardData(req,res){  
    try {
               
        

            
        const card = await SavedCard.find(
          { userId: req.params.userId }, 
          {
            card_no: 1,
            expiry_year: 1,
            expiry_month: 1,
            method: 1,
            card_holder_name: 1
        }
        );

        res.status(200).json(card);


    } catch (error) {

        console.error("Error in Card controller ",error);
        res.status(500).json({message:"Internal server error"});
    }
}






export async function updateCardData(req,res){
    try {

        const{userId,expiry_year, expiry_month, card_name}=req.body;
        const card=await SavedCard.findByIdAndUpdate(req.params.CardId,{expiry_year:expiry_year,expiry_month:expiry_month,card_name:card_name,userId:userId},{new:true,});
        if(!card) return res.status(404).json({message: "Not Found"});
        res.status(200).json({card});
          
    } catch (error) {
        console.error("Error in Card controller",error);
        res.status(500).json({message:"Internal server error"});
    }

}




export async function deleteCardData(req,res){
    
    try {
        
        const Card = await SavedCard.findByIdAndDelete(req.params.CardId)
        if(!Card) return res.status(404).json({message:"Transaction Not found"});
        res.json({message: "Deleted successfully !"})


    } catch (error) {
        console.error("Error in card controller",error);
        res.status(500).json({message:"Internal server error"});   
    }
}

