const axios = require('axios').default;
type dependencies = {
    logger: {error: (string) => void}
    env: {HUE_USER: string, BRIDGE_IP: string}
}
type state = {
    on: boolean
    bri: number
    alert: string
    mode: string
    reachable: boolean
}

type light = {
    id: string
    state: state
}

export const hueService = (dependencies: dependencies) => {
    const {env, logger} = dependencies;
    async function flipAllLights(state?: 'on' | 'off') {
        let lights = await getAllLights()
        const resp = lights.forEach((light) => {
            switch(state) {
                case undefined:
                    light.state.on = !light.state.on
                    break
                case 'on':
                    light.state.on = true
                    break
                case 'off':
                    light.state.on = false
                    break
            }
            updateLightState(light)
        })

    }

    async function getAllLights() : Promise<light[]> {
        let lights: light[] = []

        try {
            const resp = await axios({
                method: 'get',
                url: `http://192.168.1.172/api/${env.HUE_USER}/lights`
            })

            for (const lightId in resp.data) {
                lights.push({id: lightId, ...resp.data[lightId]})
            }

            return lights;

        } catch (error) {
            logger.error(error)
            return [];
        }
    }

    async function updateLightState(light: light) {
        try {
            const resp = await axios({
                method: 'put',
                url: `http://192.168.1.172/api/${env.HUE_USER}/lights/${light.id}/state`,
                headers: {}, 
                data: light.state
        })
        }
        catch (error){
            logger.error(error);
        }
    }

    return {flipAllLights}
}