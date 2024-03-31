import Combatant from './Combatant';
import './Combatants.css';

function Combatants(props) {
    return (
        <div className="combatants">
            {props.combatants.map((combatant, i) => (
                <Combatant name={combatant.name} key={i} />
            ))}
        </div>
    );
}

export default Combatants;