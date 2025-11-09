import { useEffect, useState } from "react";

export function useIsHydrated() {
	const [isHydrated, setIsHydrated] = useState(false);

	/**
	 * ハイドレーション完了を検知するためのEffect
	 *
	 * 検討した代替案: useSyncExternalStore
	 * - useSyncExternalStoreは外部ストアとの同期が本来の目的であり、
	 *   subscribeすべき外部の変更源が存在しない今回のケースでは設計思想に反する
	 * - useEffectは厳密には副作用用だが、「クライアント側でのみ実行」という目的で
	 *   使用するのはReactコミュニティで広く受け入れられているパターン
	 *
	 * 最終決定: useEffectを採用
	 * - コードの意図が明確で保守しやすい
	 * - 空のsubscribe関数を渡すAPIの誤用を避けられる
	 * - パフォーマンス差(1回の再レンダー)は実用上無視できる
	 */
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	return { isHydrated };
}
