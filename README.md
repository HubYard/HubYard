# HubYard
### What is HubYard?

HubYard is a modern and sleek social media management platform. It assists you in viewing, connecting, and posting to an audience from a vareity of networks. The service can also be used to monitor and enjoy tons of free platforms.

### Contributing

HubYard is built ontop of Node.js and MongoDB. The front end is rendered in a tonne of Jade. If you have a suggestion on a new front-end renderer I'm all ears.

Both the development and production environment are initialized the same way, please read the section below onto how to create one.

If you have any questions don't hesitate to contact us! Feel free to email us at <a href='mailto:contact@hubyard.com'>contact@hubyard.com</a>

### Setting up an Environment
<b>Step 1</b>
Install MongoDB onto a local or remote server and recieve a connection string

<b>Step 2</b>
Do the following (This assumes you already have node.js & npm installed.)

```
git clone git@github.com:forthwall/HubYard.git hubyard
cd hubyard
npm install -d
```

<b>Step 3</b>
Create a keys.js file in your root folder for HubYard with the following. (Fill in the strings with your API Keys)
```
module.exports = {	

         twitterconsume:"",
         twitterconsume_secret:"",
         instagramconsume:'',
         instagramconsume_secret:'',
         producthuntconsume:'',
         producthuntconsume_secret:'',
         dribbleconsume:'',
         dribbleconsume_secret:'',
         tumblrconsume:"",
         tumblrconsume_secret:"",
         facebookconsume:"",
         facebookconsume_secret:"",
         url_host:'http://localhost:4002',
         stripe:"",
         connection_string:''
}
```

<b>Step 4</b>
Run and Enjoy (runs on localhost:4002)
```
node app.js
```
### License

Copyright (c) 2013-2015 HubYard

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.


