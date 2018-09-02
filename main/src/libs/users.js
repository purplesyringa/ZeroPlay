import {zeroPage, zeroFS, zeroDB} from "@/zero";
import Game from "./game";

export default new class Users {
	constructor() {
		this._userCache = {};

		Game.onBroadcastMe("needUserInfo", async from => {
			console.log("needUserInfo request");
			const siteInfo = await zeroPage.getSiteInfo();
			const authAddress = siteInfo.auth_address;
			const results = await zeroDB.query(`
				SELECT * FROM json
				WHERE directory = :directory
			`, {
				directory: `users/${authAddress}`
			});

			console.log("Response", results[0]);
			Game.sendTo(from, "myUserInfo", results[0]);
		});

		Game.onBroadcast("whoseUsername", async (from, {username, field}) => {
			console.log("whoseUsername", username);

			// Hacker
			if(field !== "cert_user_id" && field !== "username") {
				return;
			}

			const results = await zeroDB.query(`
				SELECT * FROM json
				WHERE ${field} = :value
			`, {
				value: username
			});
			if(results.length === 1) {
				const address = results[0].directory.replace("users/", "");
				console.log("->", address);
				Game.sendTo(from, "myUsername", address);
			}
		});
	}

	// Register current user as <username>
	async register(username) {
		const siteInfo = await zeroPage.getSiteInfo();
		const authAddress = siteInfo.auth_address;

		let data = {
			username
		};
		data = JSON.stringify(data, null, "\t");
		await zeroFS.writeFile(`data/users/${authAddress}/data.json`, data);

		await zeroPage.publish(`data/users/${authAddress}/content.json`);
	}

	// Reply whether current user is registered --
	// i.e., has data/users/.../data.json file
	async isRegistered() {
		const siteInfo = await zeroPage.getSiteInfo();
		const authAddress = siteInfo.auth_address;

		try {
			await zeroFS.readFile(`data/users/${authAddress}/data.json`);
			return true;
		} catch(e) {
			return false;
		}
	}

	// Transform username to auth_address
	async userNameToAddress(username) {
		const field = (
			username.indexOf("@") > -1 ?
			"cert_user_id" : // It's likely cert_user_id
			"username" // It's likely username
		);

		// First, try to get the results from the database
		const results = await zeroDB.query(`
			SELECT * FROM json
			WHERE ${field} = :value
		`, {
			value: username
		});
		if(results.length > 0) {
			return results[0].directory.replace("users/", "");
		}

		Game.broadcast("whoseUsername", {username, field});
		const address = await Promise.race([
			Game.waitBroadcastMe("myUsername"),
			new Promise(resolve => setTimeout(resolve, 10000))
		]);

		if(!address) {
			throw new Error(`There is no user with username ${username}`);
		}

		return address;
	}

	// Transform auth_address to an object of information about user
	async addressToInfo(authAddress) {
		// Try to search for user data in local cache
		if(this._userCache[authAddress]) {
			return this._userCache[authAddress];
		}

		// First, try to get the results from the database
		const results = await zeroDB.query(`
			SELECT * FROM json
			WHERE directory = :directory
		`, {
			directory: `users/${authAddress}`
		});

		if(results.length > 0) {
			this._userCache[authAddress] = results[0];
			return results[0];
		}

		// Ask by auth_address
		if(!Game._addressToIp.hasOwnProperty(authAddress)) {
			// Forbid recursive call
			Game._addressToIp[authAddress] = null;
		}
		await Game.sendTo(authAddress, "needUserInfo");
		const userInfo = await Promise.race([
			Game.waitFrom(authAddress, "myUserInfo"),
			new Promise(resolve => setTimeout(resolve, 10000))
		]);

		if(!userInfo) {
			throw new Error(`There is no user with address ${authAddress}`);
		}

		this._userCache[authAddress] = userInfo;
		return userInfo;
	}

	async setInfo(info) {
		const siteInfo = await zeroPage.getSiteInfo();
		const authAddress = siteInfo.auth_address;

		let data = JSON.parse(await zeroFS.readFile(`data/users/${authAddress}/data.json`));
		Object.assign(data, info);
		data = JSON.stringify(data, null, "\t");
		await zeroFS.writeFile(`data/users/${authAddress}/data.json`, data);

		await zeroPage.publish(`data/users/${authAddress}/content.json`);
	}
};