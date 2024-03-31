import { useEffect, useState } from 'react';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import Combatants from './components/Combatants';
import redFrame from '../src/assets/images/OrnateRedFrame.png';
import './App.css';

function App() {
    const [connection, setConnection] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [addData, setAddData] = useState({
        name: '',
        bonus: ''
    });
    const [removeName, setRemoveName] = useState('');
    const [combatants, setCombatants] = useState([]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder().withUrl('https://localhost:7175/partyHub', {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        }).build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        async function start() {
            if (connection) {
                try {
                    connection.start()
                        .then(() => console.log('Connected to SignalR hub'))
                        .catch(err => console.error('Error connecting to hub:', err));

                    connection.on('ReceiveUpdate', updatedCombatants => {
                        setCombatants(JSON.parse(updatedCombatants));
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }
        }

        start();
    }, [connection]);

    const getInitiative = (bonus) => {
        return (Math.floor(Math.random() * 20) + 1) + Number(bonus);
    };

    const sortAndSetCombatants = (tempArray, preserveFirst) => {
        let firstItem = preserveFirst ? tempArray.shift() : null;

        tempArray.sort((a, b) => {
            return b.initiative - a.initiative;
        });

        if (firstItem != null) tempArray.unshift(firstItem);

        sendUpdate(tempArray);
    };

    const sendUpdate = (tempArray) => {
        // Invoking connection will call setCombatants
        connection.invoke("SendUpdate", JSON.stringify(tempArray)).catch((err) => {
            return console.error(err.toString());
        });
    };

    const addCombatant = () => {
        if (addData.name == '' || addData.bonus == '') return;

        var temp = [...combatants];

        temp.push({
            name: addData.name,
            initiative: getInitiative(addData.bonus),
            bonus: addData.bonus
        });

        sortAndSetCombatants(temp, hasStarted);

        // Reset values
        setAddData({
            name: '',
            bonus: ''
        });
    };

    const removeCombatant = () => {
        if (removeName == '') return;

        const filteredArray = combatants.filter((combatant) => {
            return combatant.name !== removeName;
        });

        sendUpdate(filteredArray);

        // Reset value
        setRemoveName('');
    };

    const handleAddDataChange = (e) => {
        setAddData((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
        });
    };

    const rerollInitiative = () => {
        if (combatants.length == 0) return;

        let temp = [];

        combatants.forEach(combatant => {
            temp.push({
                name: combatant.name,
                initiative: getInitiative(combatant.bonus),
                bonus: combatant.bonus
            });
        });

        sortAndSetCombatants(temp, false);
        setHasStarted(false);
    };

    const nextTurn = () => {
        if (combatants.length == 0) return;

        let temp = [...combatants];
        const firstItem = temp.shift();

        temp.push(firstItem);

        sendUpdate(temp);

        if (!hasStarted) setHasStarted(true);
    };

    const previousTurn = () => {
        if (!hasStarted || combatants.length == 0) return;

        let temp = [...combatants];
        let lastItem = temp.pop();

        sendUpdate([lastItem, ...temp]);
    };

    return (
        <div className="page flex">
            <h1>Initiative Tracker</h1>
            <img alt="decorative frame" className="frame" src={redFrame} />

            <div id="content">
                <Combatants combatants={combatants} />

                <div id="controls">
                    <div>
                        <div className="flex">
                            <button type="button" id="previous" onClick={previousTurn}>
                                <span>Previous</span>
                            </button>
                            <button type="button" id="next" onClick={nextTurn}>
                                <span>Next</span>
                            </button>
                        </div>
                        <button type="button" id="reroll" onClick={rerollInitiative}>Reroll Initiative</button>
                    </div>
                
                    <div>
                        <input type="text" placeholder="Name" value={removeName} onChange={(e) => setRemoveName(e.target.value)} />
                        <button type="button" onClick={removeCombatant}>Remove Combatant</button>
                    </div>

                    <div>
                        <input type="text" placeholder="Name" value={addData.name} name="name" onChange={handleAddDataChange} />
                        <input type="number" placeholder="Initiative Bonus" value={addData.bonus} name="bonus" onChange={handleAddDataChange} />
                        <button type="button" onClick={addCombatant}>Add Combatant</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;