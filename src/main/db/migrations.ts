import * as m_000_init from './migrations/000_init'
import * as m_001_app_settings from './migrations/001_app_settings'
import * as m_002_telephone_setting from './migrations/002_telephone_setting'
import * as m_003_doa_dod from './migrations/003_doa_dod'
import * as m_004_surgery_templates from './migrations/004_surgery_templates'
import * as m_005_backup_settings from './migrations/005_backup_settings'
import * as m_006_onboarding_setting from './migrations/006_onboarding_setting'
import * as m_007_activity_log from './migrations/007_activity_log'
import * as m_008_backup_frequency from './migrations/008_backup_frequency'
import * as m_009_patient_medical_history from './migrations/009_patient_medical_history'
import * as m_010_print_templates from './migrations/010_print_templates'
import * as m_011_default_print_templates from './migrations/011_default_print_templates'
import * as m_012_surgery_inward_referral from './migrations/012_surgery_inward_referral'
import * as m_013_update_default_templates_inward_referral from './migrations/013_update_default_templates_inward_referral'
import * as m_014_sync_default_templates from './migrations/014_sync_default_templates'
import * as m_015_add_discharge_plan from './migrations/015_add_discharge_plan'
import * as m_016_update_default_templates_discharge_plan from './migrations/016_update_default_templates_discharge_plan'

export default {
  '000_init': m_000_init,
  '001_app_settings': m_001_app_settings,
  '002_telephone_setting': m_002_telephone_setting,
  '003_doa_dod': m_003_doa_dod,
  '004_surgery_templates': m_004_surgery_templates,
  '005_backup_settings': m_005_backup_settings,
  '006_onboarding_setting': m_006_onboarding_setting,
  '007_activity_log': m_007_activity_log,
  '008_backup_frequency': m_008_backup_frequency,
  '009_patient_medical_history': m_009_patient_medical_history,
  '010_print_templates': m_010_print_templates,
  '011_default_print_templates': m_011_default_print_templates,
  '012_surgery_inward_referral': m_012_surgery_inward_referral,
  '013_update_default_templates_inward_referral': m_013_update_default_templates_inward_referral,
  '014_sync_default_templates': m_014_sync_default_templates,
  '015_add_discharge_plan': m_015_add_discharge_plan,
  '016_update_default_templates_discharge_plan': m_016_update_default_templates_discharge_plan
}
