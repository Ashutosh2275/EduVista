import { SystemSettings, ISystemSettingsDocument } from '../models';
import { CONTACT_INFO } from '../constants/contactInfo';

export class SystemSettingsRepository {
  /**
   * Fetches active configuration parameters.
   * If not created, initializes defaults.
   */
  async getSettings(): Promise<ISystemSettingsDocument> {
    let settings = await SystemSettings.findOne({ key: 'platform_settings' }).exec();
    
    if (!settings) {
      settings = new SystemSettings({
        key: 'platform_settings',
        general: { platformName: 'EduVista', maintenanceMode: false, allowRegistrations: true },
        seo: { metaTitle: 'EduVista Platform', metaDescription: 'Educational Search Portal', keywords: [] },
        contact: {
          supportEmail: CONTACT_INFO.email,
          supportPhone: CONTACT_INFO.phone,
          address: CONTACT_INFO.location,
        },
      });
      await settings.save();
    }
    
    return settings;
  }

  /**
   * Updates/saves system configuration parameters.
   */
  async updateSettings(data: any): Promise<ISystemSettingsDocument | null> {
    return SystemSettings.findOneAndUpdate(
      { key: 'platform_settings' },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }
}

export default SystemSettingsRepository;
