import re

# Standard English Stopwords list to avoid offline downloading issues
STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
    'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
    'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
    "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
    'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
    'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
    'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
}

def clean_text(text: str) -> str:
    """
    Cleans text: converts to lowercase, removes punctuation, symbols, and extra whitespaces.
    """
    if not text:
        return ""
    # Lowercase
    text = text.lower()
    # Remove punctuation & numbers
    text = re.sub(r'[^\w\s]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize(text: str) -> list:
    """
    Splits text into words.
    """
    return clean_text(text).split()

def remove_stopwords(tokens: list) -> list:
    """
    Removes stopwords from a token list.
    """
    return [w for w in tokens if w not in STOPWORDS]

def lemmatize_word(word: str) -> str:
    """
    Applies basic lemmatization rules (stemming suffixes like 'ing', 'ed', 's', 'es').
    """
    if word.endswith('ing'):
        return word[:-3]
    if word.endswith('ed'):
        return word[:-2]
    if word.endswith('es') and not word.endswith('ees'):
        return word[:-2]
    if word.endswith('s') and not word.endswith('ss') and not word.endswith('us'):
        return word[:-1]
    return word

def preprocess_pipeline(text: str) -> str:
    """
    Full text preprocessing pipeline: clean, tokenize, remove stopwords, lemmatize, and join back.
    """
    tokens = tokenize(text)
    tokens_no_stop = remove_stopwords(tokens)
    lemmas = [lemmatize_word(w) for w in tokens_no_stop]
    return " ".join(lemmas)
