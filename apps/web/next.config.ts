import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	cacheLife: {
		permanent: {
			expire: Number.MAX_VALUE,
			revalidate: Number.MAX_VALUE,
			stale: Number.MAX_VALUE,
		},
	},
	typedRoutes: true,
};

export default nextConfig;
