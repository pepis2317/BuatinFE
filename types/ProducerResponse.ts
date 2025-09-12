export type ProducerResponse={
    producerId:string
    producerName:string
    owner:{
        userId:string,
        userName:string,
    },
    rating:number
    clients:number
    banner:string | null
    producerPicture:string
}