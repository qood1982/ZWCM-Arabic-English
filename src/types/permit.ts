export interface WorkPermit {
  application: string;
  description: string;
  type: string;
  wpStatus?: string;
  workCenter: string;
  mainWorkCenter: string;
  functionalLocation: string;
  functionalLocationDesc: string;
  receivedBy: string;
  receivedByName: string;
  issuedBy: string;
  issuedByName: string;
  issuedOn: string;
  issuedAt: string;
  validFrom: string;
  validFromTime: string;
  validTo: string;
  validToTime: string;
  deEnergized: boolean;
  receiverPersonalLock: string;
}
