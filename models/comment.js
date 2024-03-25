const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const commentSchema=new Schema({
    commentId:{
        type:Number,
        required:true,
        unique:true
    },
    postId:{
        type:Number,
        ref:'post',
        required:true
    },
    userId:{
        type:Number,
        ref:'user',
        required:true
    },
    text:{
        type:String,
        required:false
    },
    parentCommentId:[
        {
            type: [Schema.Types.ObjectId],
            ref: "comment",
            required: false,
        }
    ],
    votes:{
        type:Number,
        required:false
    },
    isHidden:{
        type:Boolean,
        required: false
    },
});
module.exports=mongoose.model('comment',commentSchema);
