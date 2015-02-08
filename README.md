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
git clone git@github.com:HubYard/HubYard.git hubyard
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
        url_host:'',
        stripe:"",
        connection_string:'',
        email:{	
            host		: '',
            user 		: '',
            password 	: '',
            sender		: ''
        }
}
```

<b>NOTE: If you want to test payments, check /public/js/controller.js:60 and add your publisher key.</b>

<b>Step 4</b>
Run and Enjoy (runs on localhost:4002)
```
node app.js
```
### License

Copyright 2015 Shubham Naik // HubYard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
=======
http://hubyard.com
