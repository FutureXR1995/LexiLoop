"""
Content Validator Service
Validates the quality and appropriateness of generated stories
"""

import re
import asyncio
from typing import List, Tuple, Dict
from dataclasses import dataclass

@dataclass
class ValidationResult:
    is_valid: bool
    quality_score: float
    issues: List[str]
    vocabulary_coverage: float
    readability_score: float
    coherence_score: float

class ContentValidator:
    def __init__(self):
        self.min_quality_threshold = 0.7
        
        # Common English words for readability analysis
        self.common_words = {
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
            'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
            'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
            'she', 'her', 'or', 'an', 'will', 'my', 'one', 'all',
            'would', 'there', 'their', 'what', 'so', 'up', 'out',
            'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
            'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
            'take', 'people', 'into', 'year', 'your', 'good', 'some',
            'could', 'them', 'see', 'other', 'than', 'then', 'now',
            'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work',
            'first', 'well', 'way', 'even', 'new', 'want', 'because',
            'any', 'these', 'give', 'day', 'most', 'us'
        }

    async def validate(self, content: str, vocabulary: List[str]) -> Tuple[bool, float]:
        """
        Main validation method that checks content quality
        Returns (is_valid, quality_score)
        """
        try:
            # Run all validation checks
            validation_result = await self._comprehensive_validation(content, vocabulary)
            
            return validation_result.is_valid, validation_result.quality_score
            
        except Exception as e:
            print(f"Validation error: {e}")
            return False, 0.0

    async def _comprehensive_validation(self, content: str, vocabulary: List[str]) -> ValidationResult:
        """Perform comprehensive content validation"""
        issues = []
        
        # 1. Basic content checks
        if len(content.strip()) < 100:
            issues.append("Content too short")
        
        if len(content.strip()) > 1500:
            issues.append("Content too long")
        
        # 2. Vocabulary coverage check
        vocab_coverage = self._check_vocabulary_coverage(content, vocabulary)
        if vocab_coverage < 0.8:  # At least 80% of vocabulary should be used
            issues.append(f"Low vocabulary coverage: {vocab_coverage:.2f}")
        
        # 3. Readability check
        readability_score = self._check_readability(content)
        if readability_score < 0.5:
            issues.append("Poor readability")
        
        # 4. Coherence check
        coherence_score = self._check_coherence(content)
        if coherence_score < 0.6:
            issues.append("Poor coherence")
        
        # 5. Grammar and structure check
        grammar_score = self._check_basic_grammar(content)
        if grammar_score < 0.7:
            issues.append("Grammar issues detected")
        
        # Calculate overall quality score
        quality_score = (
            vocab_coverage * 0.3 +
            readability_score * 0.25 +
            coherence_score * 0.25 +
            grammar_score * 0.2
        )
        
        is_valid = quality_score >= self.min_quality_threshold and len(issues) <= 2
        
        return ValidationResult(
            is_valid=is_valid,
            quality_score=quality_score,
            issues=issues,
            vocabulary_coverage=vocab_coverage,
            readability_score=readability_score,
            coherence_score=coherence_score
        )

    def _check_vocabulary_coverage(self, content: str, vocabulary: List[str]) -> float:
        """Check what percentage of vocabulary words are used in the content"""
        if not vocabulary:
            return 1.0
        
        content_lower = content.lower()
        words_found = 0
        
        for word in vocabulary:
            # Check for exact word match (with word boundaries)
            word_pattern = r'\b' + re.escape(word.lower()) + r'\b'
            if re.search(word_pattern, content_lower):
                words_found += 1
        
        return words_found / len(vocabulary)

    def _check_readability(self, content: str) -> float:
        """Simple readability check based on sentence length and word complexity"""
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return 0.0
        
        total_words = 0
        total_syllables = 0
        complex_words = 0
        
        for sentence in sentences:
            words = sentence.split()
            total_words += len(words)
            
            for word in words:
                syllables = self._count_syllables(word)
                total_syllables += syllables
                
                if syllables > 2 and word.lower() not in self.common_words:
                    complex_words += 1
        
        if total_words == 0:
            return 0.0
        
        # Simple readability score
        avg_sentence_length = total_words / len(sentences)
        avg_syllables = total_syllables / total_words
        complexity_ratio = complex_words / total_words
        
        # Normalize scores (ideal ranges: sentence length 10-20, syllables 1.5-2.5)
        sentence_score = max(0, 1 - abs(avg_sentence_length - 15) / 15)
        syllable_score = max(0, 1 - abs(avg_syllables - 2) / 2)
        complexity_score = max(0, 1 - complexity_ratio)
        
        readability_score = (sentence_score + syllable_score + complexity_score) / 3
        
        return min(1.0, readability_score)

    def _count_syllables(self, word: str) -> int:
        """Estimate syllable count for a word"""
        word = word.lower().strip()
        if not word:
            return 0
        
        # Remove common suffixes that don't add syllables
        word = re.sub(r'(ed|es|s)$', '', word)
        
        # Count vowel groups
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel
        
        # Handle silent 'e'
        if word.endswith('e') and syllable_count > 1:
            syllable_count -= 1
        
        return max(1, syllable_count)

    def _check_coherence(self, content: str) -> float:
        """Check story coherence based on structure and flow"""
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 3:
            return 0.3
        
        coherence_indicators = {
            'transitions': ['however', 'therefore', 'meanwhile', 'then', 'next', 'finally', 'first', 'second', 'later', 'after', 'before'],
            'pronouns': ['he', 'she', 'it', 'they', 'this', 'that', 'these', 'those'],
            'connectors': ['and', 'but', 'or', 'so', 'because', 'since', 'although', 'while']
        }
        
        content_lower = content.lower()
        coherence_score = 0.5  # Base score
        
        # Check for transition words
        transition_count = sum(1 for word in coherence_indicators['transitions'] if word in content_lower)
        coherence_score += min(0.2, transition_count * 0.05)
        
        # Check for pronouns (indicating reference continuity)
        pronoun_count = sum(1 for word in coherence_indicators['pronouns'] if word in content_lower)
        coherence_score += min(0.15, pronoun_count * 0.02)
        
        # Check for logical connectors
        connector_count = sum(1 for word in coherence_indicators['connectors'] if word in content_lower)
        coherence_score += min(0.15, connector_count * 0.03)
        
        return min(1.0, coherence_score)

    def _check_basic_grammar(self, content: str) -> float:
        """Basic grammar and structure validation"""
        # Simple heuristic checks
        grammar_score = 1.0
        
        # Check for proper capitalization at sentence beginnings
        sentences = re.split(r'[.!?]+', content)
        capitalized_sentences = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and sentence[0].isupper():
                capitalized_sentences += 1
        
        if sentences:
            capitalization_ratio = capitalized_sentences / len([s for s in sentences if s.strip()])
            grammar_score *= capitalization_ratio
        
        # Check for basic punctuation
        has_periods = '.' in content
        has_proper_spacing = not re.search(r'[.!?][a-zA-Z]', content)  # Space after punctuation
        
        if not has_periods:
            grammar_score *= 0.8
        
        if not has_proper_spacing:
            grammar_score *= 0.9
        
        # Check for extremely long sentences (potential run-ons)
        words = content.split()
        if words:
            sentences_list = re.split(r'[.!?]+', content)
            if sentences_list:
                avg_sentence_length = len(words) / len([s for s in sentences_list if s.strip()])
                if avg_sentence_length > 30:  # Very long sentences
                    grammar_score *= 0.8
        
        return max(0.0, grammar_score)