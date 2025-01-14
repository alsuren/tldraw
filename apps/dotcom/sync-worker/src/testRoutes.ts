import { createRouter, notFound } from '@tldraw/worker-shared'
import type { Environment } from './types'
import { getReplicator, getUserDurableObject } from './utils/durableObjects'

export const testRoutes = createRouter<Environment>()
	.all('/app/__test__/*', (_, env) => {
		if (env.IS_LOCAL !== 'true') return notFound()
		return undefined
	})
	.get('/app/__test__/replicator/reboot', (_, env) => {
		getReplicator(env).__test__forceReboot()
		return new Response('ok')
	})
	.get('/app/__test__/replicator/panic', (_, env) => {
		getReplicator(env).__test__panic()
		return new Response('ok')
	})
	.get('/app/__test__/user/:userId/reboot', (req, env) => {
		getUserDurableObject(env, req.params.userId).handleReplicationEvent({
			type: 'force_reboot',
			sequenceId: 'test',
		})
		return new Response('ok')
	})
	.get('/app/__test__/user/:userId/panic', (req, env) => {
		getUserDurableObject(env, req.params.userId).handleReplicationEvent({
			type: 'force_reboot',
			sequenceId: 'test',
		})
		return new Response('ok')
	})
	.all('*', notFound)
