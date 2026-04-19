// views/shell/ChatFab.jsx — Floating chat-support button.
(function () {
  const { Icon } = HB.Views;

  function ChatFab() {
    return (
      <button className="chat-fab" title="Chat support">
        <Icon name="chat" size={18}/>
      </button>
    );
  }

  HB.Views.ChatFab = ChatFab;
})();
