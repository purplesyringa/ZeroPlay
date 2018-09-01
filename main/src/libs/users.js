import {zeroPage, zeroFS} from "@/zero";

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

		return await zeroFS.fileExists(`data/users/${authAddress}/data.json`);
	}
};