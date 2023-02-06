let _AWS = require("aws-sdk");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.handler = async (event: any, context: any, callback: any) => {
  
   const data = event.Records[0];
   if(data.eventName != 'INSERT' && data.eventSource != 'aws:dynamodb'){
       return;
   }
    const emailTo = data["dynamodb"]['NewImage']['email']['S'];

    let mailOptions = {
        from: 'sankalp.chari@sjinnovation.com',
        to: emailTo,
        subject: 'Your email is here',
        html: "<h3>This is a test email</h3>"
    };

    sgMail
    .send(mailOptions)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error:any) => {
      console.error(error)
    })

}
