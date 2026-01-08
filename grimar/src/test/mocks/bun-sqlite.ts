export class Database {
	constructor(_path: string) {}
	query() {
		return { get: () => {}, all: () => [] };
	}
	run() {}
	exec() {}
	prepare() {
		return { get: () => {}, all: () => [], run: () => {} };
	}
}
