import { PRESETS, PRESET_IDS } from '../lib/defaults.js'
import styles from './PresetPicker.module.css'

/**
 * Picks which set of starting lists the app is built from.
 *
 * A native select rather than a segmented control: it stays one control wide
 * however many presets there are, brings its own picker on phones, and is
 * keyboard- and screen-reader-ready without any ARIA of our own.
 */
export default function PresetPicker({ value, onChange, disabled }) {
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="preset-select">Defaults</label>

      <span className={styles.field}>
        <select
          id="preset-select"
          className={styles.select}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
          {PRESET_IDS.map((id) => (
            <option key={id} value={id}>
              {PRESETS[id].label ?? id}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}
