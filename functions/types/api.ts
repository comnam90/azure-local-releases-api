// Types for Azure Local Releases API

export interface Release {
  version: string;
  availabilityDate: string;
  newDeployments: boolean;
  osBuild: string;
  releaseTrain: string;
  release: string;
  releaseShortened: string;
  baselineRelease: boolean;
  buildType: 'Feature' | 'Cumulative';
  endOfSupportDate?: string;
  supported: boolean;
  solutionUpdate: SolutionUpdate;
  urls: ReleaseUrls;
}

export interface SolutionUpdate {
  uri?: string;
  fileHash?: string;
}

export interface ReleaseUrls {
  security: string;
  news: string;
  issues: string;
}

export interface ReleaseTrain {
  supported: boolean;
  releaseTrain: string;
}

export interface ReleasesResponse {
  releases: Release[];
}

export interface ReleaseTrainsResponse {
  releaseTrains: ReleaseTrain[];
}

// Query parameter interfaces
export interface ReleasesQueryParams {
  supported?: boolean;
  releaseTrain?: string;
  baselineRelease?: boolean;
  buildType?: 'Feature' | 'Cumulative';
  version?: string;
  osBuild?: string;
  newDeployments?: boolean;
  solutionUpdate?: boolean;
  latest?: boolean;
}

export interface ReleaseTrainsQueryParams {
  supported?: boolean;
  releaseTrain?: string;
  latest?: boolean;
}

// External data source interfaces
export interface ExternalReleaseData {
  version: string;
  osBuild: string;
  availabilityDate: string;
  securityUpdateUrl: string;
  whatsNewUrl: string;
  knownIssuesUrl: string;
  newDeployments: boolean;
}

export interface ExternalSolutionUpdateData {
  osBuild: string;
  downloadUri: string;
  sha256: string;
  availabilityDate: string;
}

// Cloudflare environment interface
export interface Env {
  CACHE: KVNamespace;
  ENVIRONMENT?: string;
}
