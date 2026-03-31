class ApiErro extends Error{
    constructor(
        statusCode,
        message= "somthing went wrong",
        errors= [],
        stack= ""

    ){
        super(message)
        this.statusCode= statusCode
        this.data= null
        this.message = message
        this.success= false
        this.errors= errors

        if(statck){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiErro}