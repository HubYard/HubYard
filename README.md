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

HubYard - Social Media Management
Copyright (C) 2014  Shubham Naik // HubYard

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>

