"use strict";

/*
 * Created with @iobroker/create-adapter v1.26.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

const { curly } = require("node-libcurl");
const querystring = require("querystring");

const { timeStamp } = require("console");

const  Test_API_SITE_BASE  = "https://reqres.in";
// Load your modules here, e.g.:

let myBG15;


// const fs = require("fs");

class Bg15 extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "bg15",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		myBG15 = this;

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("config client_username: " + this.config.client_username);
		this.log.info("config client_password: " + this.config.client_secret);


		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("server_token", {
			type: "state",
			common: {
				name: "server_token",
				type: "string",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("testtext", {
			type: "state",
			common: {
				name: "testtext",
				type: "string",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("testVariable");
		this.subscribeStates("server_token");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		// Set adapter LED indicator to green
		this.setState("info.connection", true, true);


		const { statusCode, data, headers } = await curly.get("http://www.google.com");

		this.log.info("------Status--------");
		this.log.info(statusCode.toString());
		this.log.info("------Data--------");
		this.log.info(data.toString());
		this.log.info("------Headers--------");
		this.log.info(headers.toString());

		const UrlBG = "https://ws.bluegen-net.com/customer/login";
		const myuser = "test";
		const mypassword = "test";

		try {
			const { data1 } = await curly.post(UrlBG,
				{
					postFields: JSON.stringify({ username: myuser, password: mypassword }),
					httpHeader: ["Content-Type: application/json", "Accept: application/json"
					],
				});
			this.log.info("------Post return Data--------");
			this.log.info(data1.toString());
		}
		catch (e) {
			this.log.info("------Login ERROR--------");
			this.log.error(e);
		}

		await this.setStateAsync("testtext", statusCode.toString());


		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
		await this.setStateAsync("server_token", { val: "s$dlöfkasklfjaöseljafösdlkfjasöldkfj", ack: true, expire: 45 });


		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);


		await Test();


	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Bg15(options);
} else {
	// otherwise start the instance directly
	new Bg15();
}

async function Test (parameter1, parameter2){
	try {
		myBG15.log.info("------------- Test Function started ---------------");
		//myBG15.log.info("JSON.stringify = " + JSON.stringify({ name: "morpheus", pasjobsword: "leader" }));

		//const { data1 } = await curly.post(Test_API_SITE_BASE + "/api/users",
		//	{
		//		postFields: JSON.stringify({ name: "morpheus", pasjobsword: "leader" }),
		//		httpHeader: ["Content-Type: application/json", "Accept: application/json"
		//		],
		//	});
		//myBG15.log.info("------Post return Data--------");
		//myBG15.log.info(data1.toString());


		const { statusCode, data, headers } = await curly.post(Test_API_SITE_BASE + "/api/users",
			{
				postFields: querystring.stringify({Name: "morpheus", job: "leader"})
				//postFields: "name=morpheus&job=leader"
			});
		myBG15.log.info("------Post return Data--------");
		myBG15.log.info(data.toString());

		myBG15.log.info("------------- Test Function ended ---------------");
	}
	catch (e) {
		myBG15.log.info("------------- Test Function ERROR ---------------");
		myBG15.log.error(e);
		myBG15.log.info("-------------------------------------------------");
	}

}