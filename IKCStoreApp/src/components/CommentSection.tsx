import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { fetchComments, addComment, type CommentData } from '../services/firebase';

export default function CommentSection({ appId }: { appId: string }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments(appId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [appId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await addComment(appId, text, name, rating);
      const updated = await fetchComments(appId);
      setComments(updated);
      setText('');
      setRating(0);
    } catch {
      setError('Yorum gönderilemedi. Tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.section}>
        <Text style={styles.label}>Yorumlar</Text>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.nameInput}
            placeholder="İsim (opsiyonel)"
            placeholderTextColor="#5A5A78"
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
          <StarSelector value={rating} onChange={setRating} />
          <TextInput
            style={styles.textInput}
            placeholder="Yorumunu yaz..."
            placeholderTextColor="#5A5A78"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.submitBtn, (submitting || !text.trim()) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !text.trim()}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitBtnText}>Gönder</Text>}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#6366F1" style={{ marginTop: 16 }} />
        ) : comments.length === 0 ? (
          <Text style={styles.empty}>Henüz yorum yok. İlk yorumu sen yaz!</Text>
        ) : (
          comments.map(c => <CommentItem key={c.id} comment={c} />)
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
          <Text style={[starStyles.star, i <= value && starStyles.starFilled]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={[starStyles.starSm, i <= value && starStyles.starFilled]}>★</Text>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  star: { fontSize: 24, color: '#3A3A5C' },
  starFilled: { color: '#F59E0B' },
  starSm: { fontSize: 13, color: '#3A3A5C' },
});

function CommentItem({ comment }: { comment: CommentData }) {
  const initials = comment.displayName[0]?.toUpperCase() ?? '?';
  const date = comment.createdAt?.toDate
    ? comment.createdAt.toDate().toLocaleDateString('tr-TR')
    : '';

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentName}>{comment.displayName}</Text>
          {date ? <Text style={styles.commentDate}>{date}</Text> : null}
        </View>
        {comment.rating > 0 && <Stars value={comment.rating} />}
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  label: {
    fontWeight: '700',
    fontSize: 11,
    color: '#5A5A78',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputArea: {
    backgroundColor: '#10101E',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#07070F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#F1F1FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#07070F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#F1F1FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  errorText: { color: '#F87171', fontSize: 12, marginBottom: 8 },
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: {
    color: '#5A5A78',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  commentCard: {
    backgroundColor: '#10101E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E1E3A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  avatarText: { color: '#6366F1', fontWeight: '800', fontSize: 14 },
  commentName: { color: '#F1F1FF', fontWeight: '700', fontSize: 13 },
  commentDate: { color: '#5A5A78', fontSize: 11, marginTop: 1 },
  commentText: { color: '#C4C4E0', fontSize: 14, lineHeight: 20 },
});
