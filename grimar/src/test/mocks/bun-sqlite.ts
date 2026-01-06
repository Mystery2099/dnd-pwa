export class Database {
	constructor(path: string) {}
	query() {
		return { get: () => {}, all: () => [] };
	}
	run() {}
	exec() {}
	prepare() {
		return { get: () => {}, all: () => [], run: () => {} };
	}
}
