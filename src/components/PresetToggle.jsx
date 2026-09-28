import { PRESET_IDS } from '../lib/defaults.js'
import styles from './PresetToggle.module.css'

/**
 * Picks which set of starting lists the app is built from.
 *
 * Buttons rather than radios: there are only ever a handful, and aria-pressed
 * says everything a segmented control needs to say.
 */
export default function PresetToggle({ value, onChange, disabled }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label} id="preset-label">Defaults</span>

      <div className={styles.group} role="group" aria-labelledby="preset-label">
        {PRESET_IDS.map((id) => {
          const selected = id === value
          return (
            <button
              key={id}
              type="button"
              className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
              onClick={() => onChange(id)}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${id} defaults`}
            >
              {id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
