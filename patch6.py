with open('app/dashboard/MeetMario.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Set showLanding to false by default so dashboard loads directly
content = content.replace(
    'const [showLanding, setShowLanding] = useState(true);',
    'const [showLanding, setShowLanding] = useState(false);'
)

with open('app/dashboard/MeetMario.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
