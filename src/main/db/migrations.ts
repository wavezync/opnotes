import * as m_000_init from './migrations/000_init'
import * as m_001_app_settings from './migrations/001_app_settings'
import * as m_002_telephone_setting from './migrations/002_telephone_setting'
import * as m_003_doa_dod from './migrations/003_doa_dod'
import * as m_004_surgery_templates from './migrations/004_surgery_templates'

export default {
  '000_init': m_000_init,
  '001_app_settings': m_001_app_settings,
  '002_telephone_setting': m_002_telephone_setting,
  '003_doa_dod': m_003_doa_dod,
  '004_surgery_templates': m_004_surgery_templates
}
