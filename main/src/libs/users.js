import {zeroPage, zeroFS, zeroDB} from "@/zero";

export default new class Users {
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
		let results;
		if(username.indexOf("@") > -1) {
			// It's likely cert_user_id
			results = await zeroDB.query(`
				SELECT * FROM json
				WHERE cert_user_id = :cert_user_id
			`, {
				cert_user_id: username
			});
		} else {
			// It's likely username
			results = await zeroDB.query(`
				SELECT * FROM json
				WHERE username = :username
			`, {
				username
			});
		}

		if(results.length === 0) {
			throw new Error(`There is no user with username ${username}`);
		} else if(results.length > 1) {
			throw new Error(`There are several users with username ${username} -- use username@zeroid.bit to choose`);
		}

		return results[0].directory.replace("users/", "");
	}

	// Transform auth_address to an object of information about user
	async addressToInfo(authAddress) {
		const results = await zeroDB.query(`
			SELECT * FROM json
			WHERE directory = :directory
		`, {
			directory: `users/${authAddress}`
		});

		if(results.length === 0) {
			throw new Error(`There is no user with address ${authAddress}`);
		}

		return results[0];
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