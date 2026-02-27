export type StepResponse={
    stepId:string
    title:string
    description:string
    transactionId:string
    minCompleteEstimate:string
    maxCompleteEstimate:string
    status:string
    price:number
    materials: MaterialResponse[]
}
type MaterialResponse = {
    materialId:string
    name:string
    quantity:number
    unitOfMeasurement:string
    supplier:string
    cost:number
    createdAt:Date
    updatedAt:Date
}
