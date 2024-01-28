export interface DiscordServer {
  id: string;
  name: string;
  icon: string;
  features: string[];
  commands: string[];
  members: string[];
  channels: string[];
  bans: string[];
  roles: string[];
  stageInstances: string[];
  invites: string[];
  scheduledEvents: string[];
  autoModerationRules: string[];
  shardId: number;
  splash: string | null;
  banner: string | null;
  description: string | null;
  verificationLevel: number;
  vanityURLCode: string | null;
  nsfwLevel: number;
  premiumSubscriptionCount: number;
  discoverySplash: string | null;
  memberCount: number;
  large: boolean;
  premiumProgressBarEnabled: boolean;
  applicationId: string | null;
  afkTimeout: number;
  afkChannelId: string | null;
  systemChannelId: string;
  premiumTier: number;
  widgetEnabled: boolean | null;
  widgetChannelId: string | null;
  explicitContentFilter: number;
  mfaLevel: number;
  joinedTimestamp: number;
  defaultMessageNotifications: number;
  systemChannelFlags: number;
  maximumMembers: number;
  maximumPresences: number | null;
  maxVideoChannelUsers: number;
  maxStageVideoChannelUsers: number;
  approximateMemberCount: number | null;
  approximatePresenceCount: number | null;
  vanityURLUses: number | null;
  rulesChannelId: string | null;
  publicUpdatesChannelId: string | null;
  preferredLocale: string;
  safetyAlertsChannelId: string | null;
  ownerId: string;
  emojis: string[];
  stickers: string[];
  createdTimestamp: number;
  nameAcronym: string;
  iconURL: string;
  splashURL: string | null;
  discoverySplashURL: string | null;
  bannerURL: string | null;
}

export interface DiscordServerResponse {
  server_data: DiscordServer;
}
