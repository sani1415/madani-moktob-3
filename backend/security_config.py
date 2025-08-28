"""
Security Configuration Module
Handles login attempt tracking, rate limiting, and security settings
"""

import time
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class SecurityConfig:
    def __init__(self):
        # Security settings
        self.MAX_LOGIN_ATTEMPTS = 5
        self.LOCKOUT_DURATION = 15 * 60  # 15 minutes in seconds
        self.SESSION_TIMEOUT = 60 * 60  # 60 minutes in seconds
        
        # In-memory storage for failed login attempts
        # In production, consider using Redis or database
        self.failed_attempts: Dict[str, Dict] = {}
        
        # Clean up old entries every 100 requests
        self.cleanup_counter = 0
        
    def is_ip_locked(self, ip_address: str) -> Tuple[bool, Optional[int]]:
        """
        Check if an IP address is currently locked out
        
        Returns:
            Tuple[bool, Optional[int]]: (is_locked, remaining_lockout_time)
        """
        if ip_address not in self.failed_attempts:
            return False, None
            
        attempt_data = self.failed_attempts[ip_address]
        last_attempt_time = attempt_data['last_attempt']
        attempt_count = attempt_data['count']
        
        # Check if max attempts reached
        if attempt_count >= self.MAX_LOGIN_ATTEMPTS:
            time_since_last = time.time() - last_attempt_time
            
            # If still within lockout period
            if time_since_last < self.LOCKOUT_DURATION:
                remaining_time = int(self.LOCKOUT_DURATION - time_since_last)
                return True, remaining_time
            else:
                # Lockout period expired, reset attempts
                self._reset_attempts(ip_address)
                return False, None
                
        return False, None
    
    def record_failed_attempt(self, ip_address: str) -> Tuple[bool, Optional[int]]:
        """
        Record a failed login attempt for an IP address
        
        Returns:
            Tuple[bool, Optional[int]]: (is_locked, remaining_lockout_time)
        """
        current_time = time.time()
        
        if ip_address not in self.failed_attempts:
            self.failed_attempts[ip_address] = {
                'count': 1,
                'first_attempt': current_time,
                'last_attempt': current_time
            }
            return False, None
        
        attempt_data = self.failed_attempts[ip_address]
        attempt_data['count'] += 1
        attempt_data['last_attempt'] = current_time
        
        # Log the failed attempt
        logger.warning(f"Failed login attempt from IP {ip_address}. "
                      f"Attempt {attempt_data['count']}/{self.MAX_LOGIN_ATTEMPTS}")
        
        # Check if max attempts reached
        if attempt_data['count'] >= self.MAX_LOGIN_ATTEMPTS:
            lockout_until = current_time + self.LOCKOUT_DURATION
            logger.warning(f"IP {ip_address} locked out until "
                          f"{datetime.fromtimestamp(lockout_until).strftime('%Y-%m-%d %H:%M:%S')}")
            return True, self.LOCKOUT_DURATION
        
        return False, None
    
    def record_successful_login(self, ip_address: str):
        """Record a successful login and reset failed attempts for an IP"""
        if ip_address in self.failed_attempts:
            logger.info(f"Successful login from IP {ip_address}. "
                       f"Resetting failed attempts (was {self.failed_attempts[ip_address]['count']})")
            self._reset_attempts(ip_address)
    
    def _reset_attempts(self, ip_address: str):
        """Reset failed attempts for an IP address"""
        if ip_address in self.failed_attempts:
            del self.failed_attempts[ip_address]
    
    def cleanup_old_entries(self):
        """Remove old failed attempt entries to prevent memory bloat"""
        self.cleanup_counter += 1
        
        # Only cleanup every 100 requests to avoid performance impact
        if self.cleanup_counter < 100:
            return
            
        self.cleanup_counter = 0
        current_time = time.time()
        expired_ips = []
        
        for ip_address, attempt_data in self.failed_attempts.items():
            # Remove entries older than 1 hour
            if current_time - attempt_data['last_attempt'] > 3600:
                expired_ips.append(ip_address)
        
        for ip_address in expired_ips:
            del self.failed_attempts[ip_address]
            
        if expired_ips:
            logger.info(f"Cleaned up {len(expired_ips)} expired failed attempt entries")
    
    def get_security_stats(self) -> Dict:
        """Get current security statistics for monitoring"""
        current_time = time.time()
        locked_ips = []
        active_attempts = {}
        
        for ip_address, attempt_data in self.failed_attempts.items():
            if attempt_data['count'] >= self.MAX_LOGIN_ATTEMPTS:
                time_since_last = current_time - attempt_data['last_attempt']
                if time_since_last < self.LOCKOUT_DURATION:
                    remaining_time = int(self.LOCKOUT_DURATION - time_since_last)
                    locked_ips.append({
                        'ip': ip_address,
                        'attempts': attempt_data['count'],
                        'locked_until': datetime.fromtimestamp(
                            attempt_data['last_attempt'] + self.LOCKOUT_DURATION
                        ).strftime('%Y-%m-%d %H:%M:%S'),
                        'remaining_lockout': remaining_time
                    })
            
            active_attempts[ip_address] = {
                'count': attempt_data['count'],
                'first_attempt': datetime.fromtimestamp(attempt_data['first_attempt']).strftime('%Y-%m-%d %H:%M:%S'),
                'last_attempt': datetime.fromtimestamp(attempt_data['last_attempt']).strftime('%Y-%m-%d %H:%M:%S')
            }
        
        return {
            'total_tracked_ips': len(self.failed_attempts),
            'currently_locked_ips': len(locked_ips),
            'locked_ips': locked_ips,
            'active_attempts': active_attempts,
            'max_attempts': self.MAX_LOGIN_ATTEMPTS,
            'lockout_duration_minutes': self.LOCKOUT_DURATION // 60,
            'session_timeout_minutes': self.SESSION_TIMEOUT // 60
        }

# Global security configuration instance
security_config = SecurityConfig()
