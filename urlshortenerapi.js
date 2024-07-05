require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//My Solution//
//In this course we will be working with mongoose in order to set uo our url shortener
//Database connection//
let uri =  'mongodb+srv://Victors:' + process.env.PW + '@victorsesan.bdbgdox.mongodb.net/fcc-mongodb-and-mongoose?retryWrites=true&w=majority&appName=Victorsesan'
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Creating url model//
//Before we can start storing url info to our databse in moongoose we need to create a url and 

//Creating a schema in mongoose for our url: Ps refer to mongoose lesson for more info//

let urlSchema = new mongoose.Schema({
original : {type: String, requested: true},
short : Number
})

//Above i have set up my url in a mongoose schema to have an original url eg www.fcc.com and to have a shortener whic is a number as the project requires//

//creating a model//

let url = mongoose.model('Url', urlSchema)

//Above is a model which will have an original field and short field and assign to our let url variable
//And thats all about creating url model in our mongoose and saving them//

//2# Get the url params
//The next step is to find a way to get the written url the user has put in the form. I.e To get the url he user have written and submitted by clicking on the post url button on the apk page
//If we look at our apk form button in views/index.html , we will se our post url button is is named as url and its destination when clicked is to take the user to the short url we are about to create and the method to be able to read is POST
//So that is the route we will have to set up

let bodyParser = require('body-parser')
let responseObject = {}
app.post('api/shorturl/new', bodyParser.urlencoded({ extended: false}), (req , res) => {
  let inputUrl = request.body['Url']
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  
    //The regex code above is a Universal Regex Code to make sure a url posted on site or app is in a valid url format "htpp://www.example.com"//
  if(!inputUrl.match(urlRegex)){
    response.json({error: 'Invalid URL'})
    return/*To make sure its not included in our code below*/
  }
//In the above function if the users !inputed url match the right url format according to Regex, it should go through without any errors, the excalmation is to check if the code is invalid whic after will response with an error if it does but if its not it will go through
//Otherwise if not it shoud res ponse with an error showing invalid ur
  responseObject['original_url'] = inputUrl

  //From the above code we have set our post directory to be directed to new, and call a body passer middleware funtion to get our url and setup
//What it will do is create a field in our request called body and it will put this url in there.
//Next we setup another midleware function which takes a req and a res
//If we console log req.body and click on index.html we will see our original url www.fcc.com was captured and returned

  let inputShort = 1 /* Setting up our first short url we have taken in*/

  //so we need to find a way to find our max url short number we are to use and set the new url number to one <= that

  //Next step, so we have a url and a shortener, and the first url which will show or we will have on our app pge will be the original(www.fcc.cm) and the scond url a shortener which is a number 
//So in this case we can have like 3shortener which will be placed as , the first page will be an oriiginal url and the second will be our shortener 1 page , the next will be an original url and the next will be a shortener 2 , the next will be another original url  and the next a shortener 3 url
//This is a decription for the on our url schema

  Url.findOne({})/*This is empty so it go through all  the docs in our database*/
  //Making sure the sort number is sorted in dec(-) order//
  .sort({short: "desc"})/*Url.findOne wll get the url with the highest shortener at the top*/  
   //executing to store the short url our findOne has found and 
   .exect((error, result) => {
    if(!error && result != undefined){
      /*By default the highest short url will be 1 but if we have already added something before and the highest url in our result is not 1 or more 
      meaning not defined , we want to set a new short url for the new one we've just taking in to result.short so it doesnt overide our code*/
      inputShort = result.short + 1 /*So if it have a max res and have another 1+ it should not overite*/

    }
    //Making sure there is not an error and not create duplicate , if there is a data already in our databse it should just update it

    if(!error){
      url.findOneAndUpdate(
        {original: inputUrl},
        {original: inputUrl, short: inputShort},
        {new: true, upsert: true},
        (error, savedUrl) => {
          if(!error){
            responseObject["short_url"] = savedUrl.short
            response.json(responseObject)
          }
        }
      )
    }

  })
   //What these code means we have found a doc in our databse with the highest short url
//So if we save our code and post our original url i.e www.fcc.com or any original url it will create a shorter from 1-3 and add to our database , if another url is pasted more than 3 times it will only update to a new shortener from 1 to 3 in the daatabase with its new original url// 
})

app.get('/api/shorturl/:input',( req, res) => {
  let input = request.params.input
  //Find in mongoose the data saved and redirect to the original url//
  Url.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original)/*Having our found url shortener to be directed to our original url*/ 
    }else {
      response.json('URL not found')
    }
  })
}) 
//In conclusion first our code finds a doc with a highest short url and it set the short url to a number 1>=3, if there is nothing existing it will set to 1 whichis a default value.
//If  there was no error executing we code we code to find and update first the original url and updates to a new url ,
//Otherwise if it doesnt exist our upset= true makes sure it gets created, and our new = true is a ref to the newly ceated doc
//So whenever a shortener is created it will make sure the original url is also returned

//Test #2
//If i pass an invalid url in the post box that doesnt follow the valid http://www.example.com format, the JSON res should contain an error instead

//So after we have captured our url in the let inputUrl = request.body['url'] code, we want to make sure its avalid url
//And the best way to set that up is using regular expression
//Solution above on let Regex

//Test #3
//Make our url shortener if visited by a user it will be directed a to our original url
//So if a user puts /3 url shortener it should return to whatever original url we have in the data base
//Solution above on app.get route , since the user will be putting in a created address in the adress bar





app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
