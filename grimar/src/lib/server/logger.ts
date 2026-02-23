type StubLogger = {
	info: (msg: string | Record<string, unknown>, msgOrMeta?: string | Record<string, unknown>) => StubLogger;
	warn: (msg: string | Record<string, unknown>, msgOrMeta?: string | Record<string, unknown>) => StubLogger;
	error: (msg: string | Record<string, unknown>, msgOrMeta?: string | Record<string, unknown>) => StubLogger;
	debug: (msg: string | Record<string, unknown>, msgOrMeta?: string | Record<string, unknown>) => StubLogger;
	child: (context: Record<string, unknown>) => StubLogger;
};

function createStub(): StubLogger {
	return {
		info: () => createStub(),
		warn: () => createStub(),
		error: () => createStub(),
		debug: () => createStub(),
		child: () => createStub()
	};
}

const stubLogger = createStub();

export function createModuleLogger(_module: string): StubLogger {
	return stubLogger;
}

export function createLogger(_context: Record<string, unknown>): StubLogger {
	return stubLogger;
}

export type Logger = StubLogger;

export default stubLogger;
