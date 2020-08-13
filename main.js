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
const { getUnpackedSettings } = require("http2");

const  Test_API_SITE_BASE  = "https://reqres.in";

const SolidPower_login_API_URL = "https://ws.bluegen-net.com/sustomer/login";

// Load your modules here, e.g.:

let SolidPower_Server_Token;
let SolitPower_Num_Units;

let myBG15;

let SolidPower_client_username;
let SolidPower_client_passsword;

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

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);
		
		// Referenz auf meinen Adapter
		myBG15 = this;

		try {
			// SolidPower Uwsername from Settings
			if (typeof this.config.client_username !== "undefined" && this.config.client_username !== null && this.config.client_username !== "") {
				SolidPower_client_username = this.config.client_username;
			} else {
				SolidPower_client_username = "";
				this.log.info("No SolidPower Username defined");
			}
		}
		catch (e) { this.log.error(e); }

		try {
			// SolidPower Password from Settings
			if (typeof this.config.client_secret !== "undefined" && this.config.client_secret !== null && this.config.client_secret !== "") {
				SolidPower_client_username = this.config.client_secret;
			} else {
				SolidPower_client_passsword = "";
				this.log.info("No SolidPower password defined");
			}
		}
		catch (e) { this.log.error(e); }

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
		await this.setObjectNotExistsAsync("server.version_major", {
			type: "state",
			common: {
				name: "version_major",
				type: "number",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("server.version_minor", {
			type: "state",
			common: {
				name: "version_minor",
				type: "number",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("server.version_interface", {
			type: "state",
			common: {
				name: "version_interface",
				type: "number",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("server.version_pro", {
			type: "state",
			common: {
				name: "version_pro",
				type: "number",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync("server.version_api", {
			type: "state",
			common: {
				name: "version_api",
				type: "number",
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

		if (false) {
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
		//await this.setStateAsync("server_token", { val: "s$dlöfkasklfjaöseljafösdlkfjasöldkfj", ack: true, expire: 45 });


		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);


		if (true) {
			await Test();
		}


		if (true) {
			// Login BlueGen Server und Token abholen
			await GetServerToken();
			// ServerToken in Objekt schreiben
			await this.setStateAsync("server_token", {val: SolidPower_Server_Token, ack: true});
			// Zugeortneten BlueGEN Units ermitteln
			await Get_BG_Units();
		}

		// Set adapter LED indicator to green
		this.setState("info.connection", true, true);


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

async function GetServerToken()
{
	try {
		myBG15.log.info("------------- SolidPower Server: Autentification -> Token Request---------------");

		const { statusCode, data, headers } = await curly.post(SolidPower_login_API_URL,
			{
				postFields: querystring.stringify({username: SolidPower_client_username, password: SolidPower_client_passsword}),
				httpHeader: [
					"Content-Type: application/x-www-form-urlencoded",
					"Accept: application/json"
				],
				SSL_VERIFYHOST: false,
				SSL_VERIFYPEER: false,
				SSL_VERIFYSTATUS: false,
			});

		myBG15.log.info("------------- SolidPower Server: Response ---------------");
		SolidPower_Server_Token = data.toString();
		myBG15.log.info("statusCode: " + statusCode.toString());
		myBG15.log.info("data: " + data.toString());
		myBG15.log.info("headers: " + headers.toString());

	}
	catch (e) {
		SolidPower_Server_Token = "NO TOKEN";
		myBG15.log.info("------------- ERROR getting SolidPower Server Token ---------------");
	}

}

// die BlueGen Units beim Server abfragen
async function Get_BG_Units()
{
	myBG15.log.info("------------- Get BG Units START ---------------");

	const test = {"units":[{"id":"249","name":"BG0200"},{"id":"249","name":"BG0200"}]};

	myBG15.log.info("Stringified JSON Object" + JSON.stringify(test));

	// im Moment noch mit Dummys
	const bluegen_units = {14580: "erster BG", 23785: "zweiter BG"};

	// Anzahl der Geräte in Globaler Variable ablegen
	SolitPower_Num_Units = Object.keys(bluegen_units).length;

	// Anzahl ins log
	myBG15.log.info ("Anzahl BlueGens: " + Object.keys(bluegen_units).length.toString());
	
	// Datenpunkt anlegen falls er noch nicht existiert
	await myBG15.setObjectNotExistsAsync("num_units", {
		type: "state",
		common: {name: "num_units",type: "number",role: "indicator",read: true,write: true,},
		native: {},
	});
	// Anzahl in den Datenpunkt eintragen
	await myBG15.setStateAsync("num_units", {val: SolitPower_Num_Units, ack: true});

	let akt_unit = 1;	// Zählvariable initialisieren

	// Alle Units durchgehen
	for (let key in bluegen_units ) {
		// logging
		myBG15.log.info ("ID="+ key + " Name=" +  bluegen_units[key]);
		// Datenpunkt (unit_id)) für die aktuelle Unit erstellen falls noch nicht vorhanden
		await myBG15.setObjectNotExistsAsync("units." + akt_unit + ".unit_id", {
			type: "state",
			common: {name: "unit_id",type: "number",role: "indicator",read: true,write: true,},
			native: {},
		});
		// unit_id des Gerätes in den Datenpunkt schreiben
		await myBG15.setStateAsync("units." + akt_unit + ".unit_id", {val: key, ack: true});
		
		// Datenpunkt (unit_name)) für die aktuelle Unit erstellen falls noch nicht vorhanden
		await myBG15.setObjectNotExistsAsync("units." + akt_unit + ".unit_name", {
			type: "state",
			common: {name: "unit_name",type: "string",role: "indicator",read: true,write: true,},
			native: {},
		});
		// unit_name des Gerätes in den Datenpunkt schreiben
		await myBG15.setStateAsync("units." + akt_unit + ".unit_name", {val: bluegen_units[key], ack: true});
		// nächstes Gerät => Zählvariable erhöhen
		akt_unit++;
	}
	myBG15.log.info("------------- Get BG Units FINISH ---------------");

}

async function Test (parameter1, parameter2){
	try {
		myBG15.log.info("------------- Test Function started ---------------");

		const { statusCode, data, headers } = await curly.post(Test_API_SITE_BASE + "/api/users",
			{
				postFields: querystring.stringify({name: "morpheus", job: "leader"}),
				httpHeader: [
					"Content-Type: application/x-www-form-urlencoded",
					"Accept: application/json"
				],
				SSL_VERIFYHOST: false,
				SSL_VERIFYPEER: false,
				SSL_VERIFYSTATUS: false,
			});
		myBG15.log.info("------Post return Data--------");
		myBG15.log.info(statusCode.toString());
		myBG15.log.info(headers.toString());
		myBG15.log.info(data.toString());

		myBG15.log.info("------------- Test Function ended ---------------");
	}
	catch (e) {
		myBG15.log.info("------------- Test Function ERROR ---------------");
		myBG15.log.error(e);
		myBG15.log.info("-------------------------------------------------");
	}

}