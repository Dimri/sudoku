import torch.nn as nn


class CNNModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.c1 = nn.Conv2d(
            in_channels=1, out_channels=16, kernel_size=(5, 5), stride=1, padding=0
        )
        self.relu1 = nn.ReLU()
        self.maxpool1 = nn.MaxPool2d(kernel_size=(2, 2))
        self.dropout1 = nn.Dropout(0.25)
        self.c2 = nn.Conv2d(
            in_channels=16, out_channels=32, kernel_size=(3, 3), stride=1, padding=0
        )
        self.relu2 = nn.ReLU()
        self.maxpool2 = nn.MaxPool2d(kernel_size=(2, 2))
        self.dropout2 = nn.Dropout(0.25)
        self.fc1 = nn.Linear(32 * 5 * 5, 256)
        self.dropout3 = nn.Dropout(0.25)
        self.fc2 = nn.Linear(256, 10)

    def forward(self, x):
        out = self.c1(x)  # (b, 16, 24, 24)
        out = self.relu1(out)
        out = self.maxpool1(out)  # (b, 16, 12, 12)
        out = self.dropout1(out)

        out = self.c2(out)  # (b, 32, 10, 10)
        out = self.relu2(out)
        out = self.maxpool2(out)  # (b, 32, 5, 5)
        out = self.dropout2(out)

        out = out.view(out.size(0), -1)  # (b, 32 * 5 * 5)
        out = self.fc1(out)  # (b, 256)
        out = self.dropout3(out)
        out = self.fc2(out)  # (b, 10)
        return out
