export interface SamplePreset {
  id: string;
  name: string;
  format: string;
  description: string;
  badgeColor: string;
  sampleContent: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'palo_alto',
    name: 'Palo Alto NGFW (Syslog RFC 5424)',
    format: 'Syslog',
    description: 'Corporate perimeter firewall traffic & threat events',
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    sampleContent: `<134>1 2026-09-01T10:32:01Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.10 dst=10.0.0.20 sport=54321 dport=443 action=DENY user=admin
<134>1 2026-09-01T10:32:02Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.55 dst=10.0.0.80 sport=49152 dport=80 action=ALLOW user=dev_user
<130>1 2026-09-01T10:32:18Z fw01.corp.net firewall 1024 - - proto=UDP src=192.168.1.200 dst=10.0.0.53 sport=61234 dport=53 action=BLOCK threat=DNS-Tunneling severity=CRITICAL user=guest_user`
  },
  {
    id: 'windows_security',
    name: 'Windows Active Directory (Security XML)',
    format: 'XML',
    description: 'Domain controller logon audit logs (Event 4625 / 4624)',
    badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800',
    sampleContent: `<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><Provider Name='Microsoft-Windows-Security-Auditing'/><EventID>4625</EventID><Level>0</Level><TimeCreated SystemTime='2026-09-01T10:32:04Z'/><Computer>DC01.corp.local</Computer></System><EventData><Data Name='TargetUserName'>administrator</Data><Data Name='IpAddress'>10.0.0.12</Data><Data Name='IpPort'>50210</Data><Data Name='Status'>0xC000006D</Data></EventData></Event>
<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><Provider Name='Microsoft-Windows-Security-Auditing'/><EventID>4624</EventID><Level>0</Level><TimeCreated SystemTime='2026-09-01T10:32:06Z'/><Computer>DC01.corp.local</Computer></System><EventData><Data Name='TargetUserName'>security_lead</Data><Data Name='IpAddress'>10.0.0.15</Data><Data Name='IpPort'>51230</Data><Data Name='Status'>0x0</Data></EventData></Event>`
  },
  {
    id: 'aws_cloudtrail',
    name: 'AWS CloudTrail (Multi-Line JSON)',
    format: 'JSON',
    description: 'AWS Management Console and S3 API authentication audit stream',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
    sampleContent: `{"eventVersion": "1.08", "userIdentity": {"type": "IAMUser", "userName": "root_backup", "accountId": "123456789012"}, "eventTime": "2026-09-01T10:32:10Z", "eventSource": "signin.amazonaws.com", "eventName": "ConsoleLogin", "awsRegion": "us-east-1", "sourceIPAddress": "203.0.113.45", "userAgent": "Mozilla/5.0", "errorMessage": "Failed authentication"}
{"eventVersion": "1.08", "userIdentity": {"type": "IAMUser", "userName": "finance_audit", "accountId": "123456789012"}, "eventTime": "2026-09-01T10:32:20Z", "eventSource": "s3.amazonaws.com", "eventName": "GetObject", "awsRegion": "us-east-1", "sourceIPAddress": "198.51.100.77", "errorCode": "AccessDenied", "errorMessage": "Access Denied to bucket: confidential-financial-records"}`
  },
  {
    id: 'suricata_cef',
    name: 'Suricata Network IDS (CEF Alert)',
    format: 'CEF',
    description: 'ArcSight Common Event Format threat signature telemetry',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
    sampleContent: `CEF:0|Suricata|IDP|6.0.4|2001219|ET SCAN Potential SSH Scan OUTBOUND|3|src=192.168.1.105 dst=198.51.100.12 sport=55412 dport=22 proto=TCP msg=ET SCAN Potential SSH Scan OUTBOUND
CEF:0|Suricata|IDP|6.0.4|2008500|ET EXPLOIT Apache Struts RCE CVE-2017-5638|9|src=203.0.113.88 dst=10.0.0.5 sport=41234 dport=8080 proto=TCP msg=ET EXPLOIT Apache Struts RCE CVE-2017-5638`
  },
  {
    id: 'custom_banking',
    name: 'Proprietary Banking Transaction (Unknown Format)',
    format: 'Custom / Unknown',
    description: 'Unseen format for demonstrating AI heuristic mapping suggestions',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    sampleContent: `BANKING_TXN timestamp=2026-09-01T10:32:40Z client_ip=192.168.1.77 server_ip=10.0.0.50 amount=5000.00 currency=USD action=TRANSFER_FAILED user=john_doe account=ACC-9021 reason=EXCEEDED_LIMIT
BANKING_TXN timestamp=2026-09-01T10:32:44Z client_ip=192.168.1.82 server_ip=10.0.0.50 amount=150.00 currency=USD action=TRANSFER_SUCCESS user=alice_smith account=ACC-4412 reason=APPROVED
BANKING_TXN timestamp=2026-09-01T10:32:49Z client_ip=203.0.113.99 server_ip=10.0.0.50 amount=99999.00 currency=USD action=TRANSFER_BLOCKED user=fraud_suspect account=ACC-0001 reason=SUSPICIOUS_LOCATION`
  }
];
